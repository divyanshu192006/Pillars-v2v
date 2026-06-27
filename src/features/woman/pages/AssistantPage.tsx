import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, AlertTriangle, RefreshCw,
  Heart, Baby, Pill, Droplets, Apple, Phone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
}

// ─── Suggested questions per language ────────────────────────────────────────

const SUGGESTED: Record<string, string[]> = {
  en: [
    'I have a severe headache',
    'My baby\'s movement has reduced',
    'I have swelling in my legs',
    'I am feeling nauseous and vomiting',
    'What foods should I eat during pregnancy?',
    'I have abdominal pain',
    'When should I go to the hospital?',
    'How much water should I drink?',
  ],
  hi: [
    'मुझे तेज सिरदर्द हो रहा है',
    'बच्चे की हलचल कम हो गई है',
    'पैरों में सूजन है',
    'उल्टी और मतली हो रही है',
    'गर्भावस्था में क्या खाना चाहिए?',
    'पेट में दर्द है',
    'अस्पताल कब जाना चाहिए?',
  ],
  ta: [
    'என் தலை மிகவும் வலிக்கிறது',
    'குழந்தையின் அசைவு குறைந்துவிட்டது',
    'கால்களில் வீக்கம் உள்ளது',
    'வாந்தி வருகிறது',
    'கர்ப்ப காலத்தில் என்ன சாப்பிட வேண்டும்?',
  ],
  te: [
    'నాకు తీవ్రమైన తలనొప్పి వస్తోంది',
    'శిశువు కదలిక తగ్గింది',
    'కాళ్ళలో వాపు వచ్చింది',
    'వాంతి మరియు వికారంగా ఉంది',
    'గర్భావస్థలో ఏమి తినాలి?',
  ],
  mr: [
    'मला तीव्र डोकेदुखी होत आहे',
    'बाळाची हालचाल कमी झाली आहे',
    'पायांना सूज आहे',
    'उलट्या आणि मळमळ होत आहे',
    'गर्भावस्थेत काय खावे?',
  ],
  bn: [
    'আমার তীব্র মাথাব্যথা হচ্ছে',
    'শিশুর নড়াচড়া কমে গেছে',
    'পায়ে ফোলাভাব আছে',
    'বমি বমি ভাব হচ্ছে',
    'গর্ভাবস্থায় কী খাওয়া উচিত?',
  ],
};

// ─── Markdown-like renderer (no extra dep) ────────────────────────────────────

function renderContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Emergency line
    const isEmergency = line.includes('🚨') || line.toUpperCase().includes('EMERGENCY');
    // Section header
    const isHeader = /^[🤱⚠️✅📞🚨]/.test(line.trim());

    return (
      <span key={i} className="block">
        {isEmergency ? (
          <span
            className="block rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 my-1 text-red-700 font-medium"
            dangerouslySetInnerHTML={{ __html: boldProcessed }}
          />
        ) : isHeader ? (
          <span
            className="block font-semibold text-gray-800 mt-3 mb-1"
            dangerouslySetInnerHTML={{ __html: boldProcessed }}
          />
        ) : line.startsWith('- ') ? (
          <span className="block ml-4 before:content-['•'] before:mr-2 before:text-primary-400">
            <span dangerouslySetInnerHTML={{ __html: boldProcessed.slice(2) }} />
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: boldProcessed }} />
        )}
      </span>
    );
  });
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-pink-100">
        <Bot className="h-4 w-4 text-primary-500" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const timeStr = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'items-end'}`}
    >
      {/* Avatar */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
        isUser
          ? 'bg-gradient-to-br from-primary-500 to-pink-500 text-white'
          : 'bg-gradient-to-br from-primary-100 to-pink-100'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-500" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-pink-500 text-white rounded-br-sm'
            : msg.isError
            ? 'bg-amber-50 border border-amber-200 text-amber-800 rounded-bl-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="space-y-0.5">{renderContent(msg.content)}</div>
          )}
          {msg.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-primary-400 animate-pulse ml-1 rounded-sm align-middle" />
          )}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{timeStr}</span>
      </div>
    </motion.div>
  );
}

// ─── Intelligent client-side fallback ────────────────────────────────────────

function getIntelligentFallback(message: string, lang: string): string {
  const lower = message.toLowerCase();
  type FallbackEntry = [string[], string, string];
  const matches: FallbackEntry[] = [
    [['headache','head ache','सिरदर्द','தலைவலி','తలనొప్పి','डोकेदुखी','মাথাব্যথা'],
      `🤱 **What this could mean**\nHeadaches are common in pregnancy due to hormonal changes or blood pressure.\n\n⚠️ **Warning signs**\n- Severe or sudden headache\n- Headache with blurred vision or swelling in face/hands\n\n✅ **Immediate steps**\n- Drink water, rest in a quiet room\n- Eat a small snack if you haven't eaten\n\n🚨 **Go to hospital IMMEDIATELY if**\n- Severe headache + vision changes + facial swelling — possible preeclampsia emergency.`,
      `🤱 **यह क्या हो सकता है**\nगर्भावस्था में सिरदर्द हार्मोनल बदलाव या रक्तचाप से हो सकता है।\n\n✅ **तुरंत क्या करें**\n- पानी पिएं, अंधेरे कमरे में आराम करें।\n\n🚨 **तुरंत अस्पताल जाएं यदि**\n- तेज सिरदर्द + धुंधली दृष्टि + चेहरे की सूजन।`
    ],
    [['movement','kick','moving','हलचल','அசைவு','కదలిక','हालचाल','নড়াচড়া'],
      `🤱 **What this could mean**\nBaby movements may temporarily reduce. After week 28, count movements carefully.\n\n✅ **Count kicks**\n- Lie on your left side in a quiet room\n- Drink cold water or juice\n- Count 10 movements in 2 hours\n\n🚨 **Go to hospital IMMEDIATELY if**\n- No movement felt for 12+ hours — this is an emergency.`,
      `🤱 28 सप्ताह के बाद 2 घंटे में 10 हलचल होनी चाहिए।\n\n✅ बाईं करवट लेटें, ठंडा पानी पिएं।\n\n🚨 **तुरंत अस्पताल जाएं यदि** 12+ घंटे से कोई हलचल नहीं।`
    ],
    [['swelling','swell','सूजन','வீக்கம்','వాపు','सूज','ফোলা'],
      `🤱 **What this could mean**\nMild foot/ankle swelling is normal in pregnancy.\n\n⚠️ **Warning signs**\n- Sudden swelling in face or hands\n- Swelling with headache + vision changes\n\n✅ **Immediate steps**\n- Elevate feet, sleep on left side, drink water\n\n🚨 **Go to hospital if**\n- Sudden facial swelling + headache + vision changes.`,
      `🤱 पैरों की हल्की सूजन सामान्य है।\n\n🚨 **तुरंत जाएं यदि** चेहरे की सूजन + सिरदर्द + धुंधली दृष्टि।`
    ],
    [['bleed','blood','रक्त','खून','இரத்தம்','రక్తం','रक्तस्राव','রক্ত'],
      `🚨 **EMERGENCY**\nAny vaginal bleeding during pregnancy requires IMMEDIATE medical attention.\n\n- Call your ASHA worker NOW\n- Use the SOS button in this app\n- Go to the nearest hospital immediately\n- Lie on your left side while waiting for help`,
      `🚨 **आपातस्थिति** — कोई भी रक्तस्राव तुरंत चिकित्सीय ध्यान की मांग करता है।\n\nअभी ASHA कार्यकर्ता को बुलाएं और SOS बटन दबाएं।`
    ],
    [['vomit','nausea','sick','उल्टी','மசக்கை','వాంతి','ओकारी','বমি'],
      `🤱 **What this could mean**\nNausea is very common especially in the first trimester.\n\n✅ **Home remedies**\n- Eat small frequent meals every 2-3 hours\n- Try ginger tea or dry biscuits\n- Stay hydrated with small sips of water\n\n📞 **Contact ASHA if**\n- Vomiting more than 4 times/day or unable to keep fluids down for 24 hours`,
      `🤱 मतली पहली तिमाही में सामान्य है।\n\n✅ **घरेलू उपाय** — छोटे-छोटे भोजन, अदरक की चाय, पानी के छोटे-छोटे घूंट।`
    ],
    [['food','eat','diet','nutrition','खाना','पोषण','உணவு','ఆహారం','अन्न','খাবার'],
      `🤱 **Pregnancy Nutrition Guide**\n\n✅ **Eat more of**\n- **Iron**: Spinach, lentils, jaggery, fortified cereals\n- **Calcium**: Milk, curd, ragi, sesame seeds\n- **Folic acid**: Green vegetables, eggs, chickpeas\n- **Protein**: Dal, eggs, paneer, soya\n\n⚠️ **Avoid**\n- Raw or undercooked meat/eggs\n- More than 1 cup of tea/coffee per day\n- Alcohol completely\n\n💊 **Take daily as prescribed**\n- Iron + Folic Acid tablet\n- Calcium supplement`,
      `🤱 **गर्भावस्था में पोषण**\n\n✅ अधिक खाएं: पालक, दाल, दूध, दही, रागी।\n⚠️ परहेज: कच्चा मांस, अधिक चाय, शराब बिल्कुल नहीं।\n💊 रोज लें: आयरन+फोलिक एसिड, कैल्शियम।`
    ],
  ];

  for (const [keywords, enReply, hiReply] of matches) {
    if (keywords.some((k: string) => lower.includes(k))) {
      return lang === 'hi' ? hiReply : enReply;
    }
  }

  return lang === 'hi'
    ? `🤱 मैं आपकी मदद करने के लिए यहाँ हूँ!\n\nकृपया अपना सवाल और स्पष्ट रूप से बताएं, जैसे:\n- "मुझे सिरदर्द है"\n- "बच्चे की हलचल कम है"\n- "पैरों में सूजन है"\n\n📞 **किसी भी गंभीर लक्षण के लिए तुरंत अपनी ASHA कार्यकर्ता से संपर्क करें।**`
    : `🤱 I'm here to help with your pregnancy questions!\n\nTry asking about specific symptoms like:\n- "I have a headache"\n- "My baby's movement has reduced"\n- "I have swelling in my legs"\n- "What should I eat during pregnancy?"\n\n📞 **For any serious symptoms, please contact your ASHA worker immediately.**`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { pregnancies } = useData();

  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const currentLang = i18n.language || user?.language || 'en';

  const pregnancyContext = pregnancy ? {
    week: pregnancy.gestationalWeek,
    riskLevel: pregnancy.riskLevel,
    trimester: pregnancy.trimester,
    complications: pregnancy.previousComplications?.join(', '),
  } : undefined;

  const greeting = (): Message => ({
    id: '0',
    role: 'assistant',
    content: currentLang === 'hi'
      ? `🤱 नमस्ते! मैं माँरक्षा AI स्वास्थ्य सहायक हूँ।\n\nमैं आपकी गर्भावस्था के दौरान लक्षणों, पोषण और कब मदद लें — इसमें मार्गदर्शन करने के लिए यहाँ हूँ।\n\n**मैं आपकी किस बात में मदद कर सकता हूँ?**\nसिरदर्द, सूजन, शिशु की हलचल, उल्टी, पेट दर्द, या कोई अन्य चिंता के बारे में बताएं।\n\n⚠️ _मैं डॉक्टर नहीं हूँ। गंभीर लक्षणों के लिए हमेशा ASHA कार्यकर्ता या डॉक्टर से मिलें।_`
      : `🤱 **Namaste! I'm MaaRaksha, your maternal health guide.**\n\nI'm here to help you understand pregnancy symptoms, nutrition, and when to seek medical care — in simple, easy-to-understand language.\n\n**How can I help you today?**\nTell me about any symptoms you're experiencing, nutrition questions, or concerns about your baby.\n\n⚠️ _I'm not a doctor. For serious symptoms, always consult your ASHA worker, nurse, or visit a health facility._`,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([greeting()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Simulate streaming by revealing text character by character
  const streamMessage = useCallback((fullText: string, msgId: string) => {
    let index = 0;
    const chunkSize = 8;

    const tick = () => {
      index = Math.min(index + chunkSize, fullText.length);
      const partial = fullText.slice(0, index);
      const done = index >= fullText.length;

      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, content: partial, isStreaming: !done } : m
      ));

      if (!done) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setShowSuggested(false);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history for multi-turn context (exclude the greeting)
    const history = messages
      .slice(1)
      .map(m => ({ role: m.role, content: m.content }));

    const assistantMsgId = `a-${Date.now()}`;

    try {
      const { reply } = await api.chatAssistant(
        text.trim(),
        currentLang,
        history,
        pregnancyContext,
      );

      // Add empty message then stream
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }]);
      setLoading(false);
      streamMessage(reply, assistantMsgId);

    } catch {
      setLoading(false);
      const fallback = getIntelligentFallback(text, currentLang);
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isError: false,
      }]);
      streamMessage(fallback, assistantMsgId);
    }
  };

  const handleSubmit = () => sendMessage(input);
  const handleSuggestion = (q: string) => sendMessage(q);

  const resetChat = () => {
    setMessages([greeting()]);
    setShowSuggested(true);
    setInput('');
    inputRef.current?.focus();
  };

  const suggestions = SUGGESTED[currentLang] || SUGGESTED.en;

  return (
    <Card className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="shrink-0 border-b bg-gradient-to-r from-primary-50 to-pink-50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">{t('assistant.title')}</p>
              <p className="text-xs text-gray-500 font-normal">{t('assistant.poweredBy')}</p>
            </div>
          </CardTitle>
          <button
            onClick={resetChat}
            className="rounded-xl p-2 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
            title="Reset chat"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Pregnancy context badge */}
        {pregnancy && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              <Baby className="h-3 w-3" /> Week {pregnancy.gestationalWeek}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              pregnancy.riskLevel === 'RED' ? 'bg-red-50 border-red-200 text-red-700' :
              pregnancy.riskLevel === 'YELLOW' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <Heart className="h-3 w-3" /> {pregnancy.riskLevel} Risk
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              T{pregnancy.trimester}
            </span>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          {/* Suggested questions */}
          <AnimatePresence>
            {showSuggested && !loading && messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
                  {t('assistant.commonQuestions')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 6).map((q, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSuggestion(q)}
                      className="rounded-2xl border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors text-left"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick topic icons after first message */}
          {!showSuggested && messages.length > 1 && !loading && (
            <div className="flex flex-wrap gap-2 justify-center py-1">
              {[
                { icon: Heart, label: t('assistant.quickTopics.symptoms'), q: currentLang === 'hi' ? 'लक्षण के बारे में बताएं' : 'Tell me about pregnancy symptoms' },
                { icon: Apple, label: t('assistant.quickTopics.nutrition'), q: currentLang === 'hi' ? 'गर्भावस्था में क्या खाना चाहिए?' : 'What foods should I eat during pregnancy?' },
                { icon: AlertTriangle, label: t('assistant.quickTopics.emergency'), q: currentLang === 'hi' ? 'अस्पताल कब जाना चाहिए?' : 'When should I go to hospital?' },
                { icon: Pill, label: t('assistant.quickTopics.medicines'), q: currentLang === 'hi' ? 'मुझे कौन सी दवाएं लेनी चाहिए?' : 'What medicines should I take?' },
                { icon: Droplets, label: t('assistant.quickTopics.hydration'), q: currentLang === 'hi' ? 'कितना पानी पीना चाहिए?' : 'How much water should I drink?' },
                { icon: Phone, label: t('assistant.quickTopics.asha'), q: currentLang === 'hi' ? 'ASHA कार्यकर्ता को कब बुलाएं?' : 'When should I contact ASHA worker?' },
              ].map(({ icon: Icon, label, q }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(q)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-colors shadow-sm"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t bg-white p-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 focus:bg-white transition-all resize-none"
                placeholder={t('assistant.placeholder')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="rounded-2xl h-11 w-11 p-0 shrink-0 bg-gradient-to-br from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 shadow-md disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-gray-400">
            {currentLang === 'hi'
              ? 'यह चिकित्सीय सलाह नहीं है। गंभीर लक्षणों के लिए डॉक्टर से मिलें।'
              : 'Not medical advice. Consult a doctor for serious symptoms.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
