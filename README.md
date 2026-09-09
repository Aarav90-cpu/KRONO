# KRONO

A OpenSource Social Media Platform!

> [!WARNING]
>
> This website is currently under early development and is not open to the public! None of the info on the website is ensured real and the half is just placeholders!

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Firebase project configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Icey067/KRONO.git
cd KRONO
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
npm start
```

## Project Structure

- `src/` - React frontend code
- `server.ts` - Express backend server
- `src/services/` - API and database services
- `src/components/` - React components
- `public/` - Static assets

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript type checking
- `npm start` - Start production server
- `npm run clean` - Clean build artifacts

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
