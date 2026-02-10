const Contact = () => {
  return (
    <div className="min-h-dvh bg-stone-100 flex items-center justify-center px-6">
      <a
        href="mailto:contact@ivancomas.studio"
        className="font-helvetica font-bold tracking-tight text-stone-900 hover:opacity-60 transition-opacity duration-300 text-center break-all"
        style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}
      >
        contact@ivancomas.studio
      </a>
    </div>
  );
};

export default Contact;
