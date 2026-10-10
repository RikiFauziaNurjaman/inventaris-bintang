<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Super Admin',
                'email'    => 'admin@inventaris.com',
                'password' => 'admin123',
                'role'     => 'super-admin',
            ],
            [
                'name'     => 'Developer',
                'email'    => 'rikinurjaman@gmail.com',
                'password' => 'developer123',
                'role'     => 'developer',
            ],
            [
                'name'     => 'Admin Operasional',
                'email'    => 'admin.operasional@inventaris.com',
                'password' => 'admin123',
                'role'     => 'admin',
            ],
            [
                'name'     => 'Petugas Gudang',
                'email'    => 'gudang@inventaris.com',
                'password' => 'gudang123',
                'role'     => 'petugas-gudang',
            ],
            [
                'name'     => 'Petugas Opname',
                'email'    => 'opname@inventaris.com',
                'password' => 'opname123',
                'role'     => 'petugas-opname',
            ],
            [
                'name'     => 'Manajer Inventaris',
                'email'    => 'manajer@inventaris.com',
                'password' => 'manajer123',
                'role'     => 'manajer',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name'     => $userData['name'],
                    'password' => Hash::make($userData['password']),
                ]
            );

            // Update nama & password jika user sudah pernah dibuat sebelumnya
            $user->update([
                'name'     => $userData['name'],
                'password' => Hash::make($userData['password']),
            ]);

            // Assign role ke user
            $role = Role::where('name', $userData['role'])->where('guard_name', 'web')->first();
            if ($role) {
                $user->syncRoles([$role]);
            }
        }
    }
}
