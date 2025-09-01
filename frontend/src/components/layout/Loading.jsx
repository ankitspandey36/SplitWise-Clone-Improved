const Loading = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-black">
    <div className="flex space-x-1 text-white text-4xl font-mono">
      {['L', 'o', 'a', 'd', 'i', 'n', 'g', '.'].map((char, i) => (
        <span
          key={i}
          className="animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {char}
        </span>
      ))}
    </div>
  </div>
);

export default Loading;