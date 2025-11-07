import UserInfo from '@/components/UserInfo';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            TaskForge360
          </h1>
          <UserInfo />
        </div>
      </main>
    </div>
  );
}
