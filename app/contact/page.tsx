export default function ContactPage() {
    return (
      <main className="bg-white min-h-screen px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[var(--navy)] mb-6">
            Get in Touch
          </h1>
          <p className="text-zinc-700 mb-12">
            Whether you’re looking to collaborate, hire, or just say hi — I’d love to hear from you.
          </p>
  
          {/* Contact Form */}
          <form
            action="mailto:blakemilam@gmail.com"
            method="POST"
            encType="text/plain"
            className="space-y-6 text-left"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-zinc-800">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                 className="w-full mt-1 p-2 border rounded border-zinc-300 text-black focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>
  
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-800">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                 className="w-full mt-1 p-2 border rounded border-zinc-300 text-black focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>
  
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-zinc-800">
                Message
              </label>
              <textarea
  name="message"
  rows={5}
  required
  className="w-full mt-1 p-2 border rounded border-zinc-300 text-black focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
/>

            </div>
  
            <button
              type="submit"
              className="bg-[var(--cardinal)] text-white px-6 py-2 rounded font-semibold hover:bg-[var(--cardinal-hover)] transition"
            >
              Send Message
            </button>
          </form>
  
          {/* Optional Links */}
          <div className="mt-12 text-sm text-zinc-600">
            <p>
              Or reach out on{' '}
              <a
                href="https://www.linkedin.com/in/blake-milam-a3491732/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cardinal)] hover:underline"
              >
                LinkedIn
              </a>
              {' '}or{' '}
              <a
                href="https://github.com/OSWarped"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cardinal)] hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }
  