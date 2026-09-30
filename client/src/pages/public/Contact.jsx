import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuMail, LuPhone, LuMapPin, LuSend } from 'react-icons/lu';
import { contactService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const contactDetails = [
  { icon: LuMail, label: 'Email', value: 'info@hamrolokbazar.com', href: 'mailto:info@hamrolokbazar.com' },
  { icon: LuPhone, label: 'Phone', value: '+977-1-234567890', href: 'tel:+9771234567890' },
  { icon: LuMapPin, label: 'Office', value: 'Kathmandu, Nepal' },
];

const Contact = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await contactService.sendMessage(data);
      toast.success('Message sent! We will get back to you soon.');
      setSent(true);
      reset({ ...data, subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-2.5 bg-surface border rounded-lg text-sm focus:border-primary ${
      errors[name] ? 'border-error' : 'border-border'
    }`;

  return (
    <div className="bg-background py-10 md:py-14">
      <div className="container-custom grid lg:grid-cols-[1fr_1.4fr] gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark mt-3">We&apos;re here to help</h1>
          <p className="text-text-light mt-4 leading-relaxed">
            Questions about an order, a product or selling with us? Send a message and our team will reply
            within one business day.
          </p>
          <ul className="mt-8 space-y-4">
            {contactDetails.map((item) => (
              <li key={item.label} className="flex items-center gap-4">
                <span className="w-11 h-11 rounded-full bg-sage text-primary flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-text-muted">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-semibold text-text hover:text-primary">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-text">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-2xl border border-border-light shadow-card p-6 sm:p-8 space-y-4"
        >
          {sent && (
            <p className="text-sm text-success bg-success-light rounded-lg px-4 py-3">
              Thanks — your message has been sent.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-text-light mb-1">
                Name
              </label>
              <input id="contact-name" className={inputClass('name')} {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-text-light mb-1">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                className={inputClass('email')}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-semibold text-text-light mb-1">
                Phone (optional)
              </label>
              <input id="contact-phone" type="tel" className={inputClass('phone')} {...register('phone')} />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-text-light mb-1">
                Subject
              </label>
              <input
                id="contact-subject"
                className={inputClass('subject')}
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && <p className="text-xs text-error mt-1">{errors.subject.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-xs font-semibold text-text-light mb-1">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              className={`${inputClass('message')} resize-none`}
              {...register('message', {
                required: 'Message is required',
                minLength: { value: 10, message: 'Please write at least 10 characters' },
              })}
            />
            {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            <LuSend className="w-4 h-4" />
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
