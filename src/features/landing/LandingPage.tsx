import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Shield, Mic, Brain, Users, Bell, BarChart3, FileText,
  ArrowRight, CheckCircle, Star, Phone, Mail, MapPin, ChevronDown,
  Activity, Globe, Smartphone, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-pink-500">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">MaaRaksha</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'How It Works', 'Impact', 'FAQ', 'Team'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-gray-600 hover:text-primary-600">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/login"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 pb-20 pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl text-center">
          <motion.div {...fadeUp}>
            <Badge className="mb-6">🏆 National Hackathon Finalist Ready</Badge>
            <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
              Protecting Every<br /><span className="gradient-text">Mother's Journey</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              AI-Powered Maternal Health Early Warning Network — reducing preventable maternal deaths through early detection, voice reporting, and intelligent risk assessment.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/login"><Button size="lg">Start Free Demo <ArrowRight className="h-5 w-5" /></Button></Link>
              <a href="#how-it-works"><Button variant="secondary" size="lg">See How It Works</Button></a>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="mx-auto mt-16 grid max-w-4xl grid-cols-3 gap-6">
            {[
              { value: '70%', label: 'Deaths Preventable' },
              { value: '50K+', label: 'ASHA Workers' },
              { value: '<24h', label: 'Alert Response' },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-6">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-20" id="problem">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-4xl font-bold">Why Maternal Deaths Happen</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">India accounts for 15% of global maternal deaths. Most are preventable with early detection.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: 'Late Detection', desc: 'Danger signs like preeclampsia and reduced fetal movement are missed until critical stages.', icon: Activity },
              { title: 'Paper Registers', desc: 'ASHA workers rely on manual registers with no real-time prioritization or alerts.', icon: FileText },
              { title: 'Communication Gaps', desc: 'Families and PHC staff are not alerted in time when emergencies occur in remote villages.', icon: Bell },
            ].map(item => (
              <motion.div key={item.title} {...fadeUp}>
                <Card className="h-full p-6">
                  <item.icon className="h-10 w-10 text-red-400" />
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-primary-50/50 to-white px-4 py-20" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-4xl font-bold">How MaaRaksha Works</h2>
          </motion.div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Voice Report', desc: 'Women speak symptoms in Hindi or regional languages via voice interface', icon: Mic },
              { step: '02', title: 'AI Analysis', desc: 'Gemini AI extracts symptoms and calculates clinical risk score', icon: Brain },
              { step: '03', title: 'Smart Alerts', desc: 'RED risk triggers automatic family & PHC alerts via email/SMS', icon: Bell },
              { step: '04', title: 'ASHA Action', desc: 'Priority dashboard helps ASHA workers reach high-risk cases first', icon: Users },
            ].map(item => (
              <motion.div key={item.step} {...fadeUp} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 text-white shadow-lg">
                  <item.icon className="h-8 w-8" />
                </div>
                <p className="mt-4 text-xs font-bold text-primary-500">STEP {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20" id="features">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-4xl font-bold">Core Features</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Voice Symptom Reporting', desc: 'Natural language voice input with live waveform and real-time transcription', icon: Mic },
              { title: 'AI Clinical Risk Engine', desc: 'GREEN/YELLOW/RED risk classification with clinical reasoning', icon: Brain },
              { title: 'ASHA Priority Dashboard', desc: 'Auto-prioritized pregnancy list replacing paper registers', icon: Users },
              { title: 'Family Alert Engine', desc: 'Automated emergency notifications to family and healthcare staff', icon: Bell },
              { title: 'Longitudinal Analytics', desc: 'Weekly, monthly, and district-level risk trend visualization', icon: BarChart3 },
              { title: 'Smart Health Reports', desc: 'AI-generated PDF reports for doctors with full risk history', icon: FileText },
              { title: 'Pregnancy Journey', desc: 'Week-by-week milestone tracking and educational content', icon: Heart },
              { title: 'Emergency SOS', desc: 'One-click emergency activation with instant alerts', icon: Zap },
              { title: 'Offline PWA', desc: 'Works in low connectivity rural areas with background sync', icon: Smartphone },
            ].map(f => (
              <motion.div key={f.title} {...fadeUp}>
                <Card className="h-full p-6 transition-shadow hover:shadow-xl">
                  <f.icon className="h-8 w-8 text-primary-500" />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="bg-gradient-to-r from-primary-600 to-pink-600 px-4 py-20 text-white" id="impact">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-display text-4xl font-bold">Impact Metrics</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '40%', label: 'Faster Risk Detection' },
              { value: '3x', label: 'ASHA Efficiency Gain' },
              { value: '85%', label: 'Alert Delivery Rate' },
              { value: '60%', label: 'Reduction in Delays' },
            ].map(m => (
              <div key={m.label} className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                <p className="text-4xl font-bold">{m.value}</p>
                <p className="mt-2 text-sm opacity-90">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="px-4 py-20" id="technology">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display text-4xl font-bold">Built with Modern Technology</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {['React + TypeScript', 'Firebase', 'Google Gemini AI', 'Node.js', 'Chart.js', 'PWA', 'Tailwind CSS', 'Framer Motion'].map(tech => (
              <Badge key={tech} variant="outline" className="px-4 py-2 text-sm">{tech}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="bg-gray-50 px-4 py-20" id="stakeholders">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-4xl font-bold">Built for Every Stakeholder</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {[
              { role: 'Pregnant Women', desc: 'Voice reporting, journey tracking, SOS' },
              { role: 'ASHA Workers', desc: 'Priority dashboard, follow-ups' },
              { role: 'Family Members', desc: 'Real-time alerts, health updates' },
              { role: 'PHC Staff', desc: 'Clinical reports, analytics' },
              { role: 'District Officers', desc: 'Population monitoring, heatmaps' },
            ].map(s => (
              <Card key={s.role} className="p-5 text-center">
                <Shield className="mx-auto h-8 w-8 text-primary-500" />
                <h3 className="mt-3 font-semibold">{s.role}</h3>
                <p className="mt-2 text-xs text-gray-500">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="px-4 py-20" id="success-stories">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-4xl font-bold">Success Stories</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Priya Sharma', village: 'Bassi, Jaipur', story: 'Voice-reported headache and swelling at week 28. MaaRaksha flagged YELLOW risk, ASHA visited within 24 hours.', outcome: 'Prevented preeclampsia progression' },
              { name: 'Sunita Meena', village: 'Chomu, Jaipur', story: 'Reduced fetal movement detected via voice. RED alert sent to family and PHC instantly.', outcome: 'Emergency referral saved mother and baby' },
              { name: 'Lakshmi Devi', role: 'ASHA Worker', village: 'Jaipur Rural', story: 'Priority dashboard helped manage 63 pregnancies efficiently, focusing on 6 high-risk cases first.', outcome: '3x faster follow-up response' },
            ].map(s => (
              <Card key={s.name} className="p-6">
                <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="mt-4 text-sm italic text-gray-600">"{s.story}"</p>
                <p className="mt-4 font-semibold">{s.name}</p>
                <p className="text-xs text-gray-500">{s.village}</p>
                <Badge variant="outline" className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700">{s.outcome}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-4xl font-bold">FAQ</h2>
          <div className="mt-10 space-y-4">
            {[
              { q: 'Does it work offline?', a: 'Yes! MaaRaksha is a PWA that caches data and syncs when connectivity returns — designed for rural India.' },
              { q: 'What languages are supported?', a: 'Hindi, English, Tamil, Telugu, Marathi, and Bengali with voice input support.' },
              { q: 'How accurate is the AI risk engine?', a: 'Our Gemini-powered engine analyzes clinical parameters aligned with WHO maternal health guidelines, with local fallback logic.' },
              { q: 'Is patient data secure?', a: 'All data is encrypted via Firebase with role-based access control and audit logging.' },
            ].map(f => (
              <details key={f.q} className="glass-card rounded-xl p-5 group">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {f.q}<ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-primary-50 px-4 py-20" id="team">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display text-4xl font-bold">Our Team</h2>
          <p className="mt-4 text-gray-600">Passionate about saving mothers' lives through technology</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {['Product & Healthcare', 'AI Engineering', 'Full Stack Dev', 'UI/UX Design'].map(role => (
              <Card key={role} className="p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-pink-400 text-2xl text-white">👩‍⚕️</div>
                <p className="mt-4 font-semibold">{role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="px-4 py-20" id="contact">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-bold">Ready to Save Lives?</h2>
          <p className="mt-4 text-gray-600">Join the maternal health revolution. Try the demo now.</p>
          <Link to="/login"><Button size="lg" className="mt-8">Launch Demo Dashboard <ArrowRight className="h-5 w-5" /></Button></Link>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@maaraksha.in</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 1800-MAA-HELP</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jaipur, Rajasthan</span>
            <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> maaraksha.in</span>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white px-4 py-8 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-primary-500" />
          <span>© 2026 MaaRaksha. Every mother deserves to live.</span>
        </div>
      </footer>
    </div>
  );
}
