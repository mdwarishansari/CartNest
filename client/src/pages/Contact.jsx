import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '../services';

const Contact = () => {
  const [form, setForm] = useState({ fromName: '', fromEmail: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.submit(form);
      toast.success('Query submitted successfully!');
      setSubmitted(true);
    } catch (err) { toast.error(err.message || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 bg-cream-paper font-graphik">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-pure-white border border-ash rounded-md p-8"
        >
          <div className="w-12 h-12 rounded-full bg-cream-paper border border-ash flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-6 h-6 text-smoke" />
          </div>
          <h2 className="text-heading font-nantes text-ink-black mb-3">Thank You</h2>
          <p className="text-caption text-smoke mb-8 leading-relaxed">Your message has been sent successfully. We&apos;ll get back to you soon.</p>
          <button onClick={() => { setSubmitted(false); setForm({ fromName: '', fromEmail: '', subject: '', message: '' }); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all cursor-pointer text-caption">
            <Send className="w-4 h-4" /> Send Another Message
          </button>
        </motion.div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-cream-paper font-graphik">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-pure-white border border-ash flex items-center justify-center mx-auto mb-4 shadow-none">
            <MessageSquare className="w-6 h-6 text-smoke" />
          </div>
          <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black mb-2">Contact Us</h1>
          <p className="text-caption text-smoke">Have a question or need help? Drop us a message.</p>
        </div>

        {/* Card */}
        <div className="bg-pure-white rounded-md border border-ash p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Name</label>
                <input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} className={inputCls} placeholder="Your name" required />
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Email</label>
                <input type="email" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} className={inputCls} placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} placeholder="What's this about?" required />
            </div>

            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputCls} min-h-[140px] resize-y`}
                placeholder="Tell us more about your question or issue..."
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 mt-2 cursor-pointer text-caption">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" />Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
