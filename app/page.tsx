export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold text-black dark:text-white">
          NorthFleet
        </h1>
        <p className="text-xl text-zinc-500">
          Fleet management for Turo hosts
        </p>
      </main>
    </div>
  );
}
