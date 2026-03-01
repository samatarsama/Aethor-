export default function App() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg">
      <div className="text-center">
        <h1
          className="font-mono text-4xl font-bold tracking-widest text-primary text-glow"
          style={{ letterSpacing: '0.3em' }}
        >
          AETHOR
        </h1>
        <p className="mt-2 font-mono text-xs text-text-dim tracking-widest uppercase">
          Intelligence Platform — Oslo
        </p>
        <div className="mt-8 h-px w-64 mx-auto bg-border" />
        <p className="mt-4 font-mono text-xs text-info">
          SYSTEM INITIALIZING...
        </p>
      </div>
    </div>
  )
}
