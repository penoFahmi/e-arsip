<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceChangeDefaultEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // LOGIKA PENGECEKAN:
        // 1. User sedang login?
        // 2. Emailnya masih 'admin@setup.app'?
        // 3. Apakah dia TIDAK sedang berada di halaman ganti email? (Supaya tidak loop)
        if ($user &&
            $user->email === 'admin@setup.app' &&
            !$request->routeIs('setup.email.*')) { // <--- Kita akan namai route-nya ini nanti

            // Tendang ke halaman ganti email
            return redirect()->route('setup.email.show');
        }

        return $next($request);
    }
}
