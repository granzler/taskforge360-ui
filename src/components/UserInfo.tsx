'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        No has iniciado sesión
      </div>
    );
  }

  // Extraer los roles del token si existen
  const roles = (session?.user as any)?.roles as string[] || [];
  
  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Perfil de Usuario</h2>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="space-y-4">
        {session?.user?.name && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <span className="text-gray-600 font-medium">Nombre:</span>
            <span className="text-gray-900">{session.user.name}</span>
          </div>
        )}
        
        {session?.user?.email && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <span className="text-gray-600 font-medium">Email:</span>
            <span className="text-gray-900">{session.user.email}</span>
          </div>
        )}

        {roles.length > 0 && (
          <div className="p-2 bg-gray-50 rounded">
            <span className="text-gray-600 font-medium">Roles:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {roles.map((role, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6">
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium mb-2">
                Mostrar información de debug
              </summary>
              <pre className="p-3 bg-gray-800 text-gray-100 rounded overflow-x-auto">
                {JSON.stringify(
                  {
                    user: session?.user,
                    expires: session?.expires
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}