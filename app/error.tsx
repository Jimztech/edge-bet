"use client";

export default function RenderErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div className="actions">
        <button className="primary" onClick={reset}>
          Try again
        </button>
        <a className="secondary" href="/">Go home</a>
      </div>
    </div>
  );
}