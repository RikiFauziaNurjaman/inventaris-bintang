<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class StockOpnameTestAccountSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        $fullAccess = Permission::pluck('name')->all();
        $participantAccess = [
            'view-dashboard',
            'view-barang-inventaris',
            'view-stock-opname',
            'participate-stock-opname',
        ];

        $accounts = [
            ['name' => 'developer', 'email' => 'rikinurjaman@gmail.com', 'password' => 'developer123', 'role' => 'developer', 'permissions' => $fullAccess],
            ['name' => 'admin', 'email' => 'admin@gmail.com', 'password' => '123', 'role' => 'super-admin', 'permissions' => $fullAccess],
            ['name' => 'Petugas Opname 1', 'email' => 'opname1@gmail.com', 'password' => 'opname123', 'role' => 'petugas-opname', 'permissions' => $participantAccess],
            ['name' => 'Petugas Opname 2', 'email' => 'opname2@gmail.com', 'password' => 'opname123', 'role' => 'petugas-opname', 'permissions' => $participantAccess],
        ];

        foreach ($accounts as $account) {
            $user = User::firstOrCreate(
                ['email' => $account['email']],
                ['name' => $account['name'], 'password' => Hash::make($account['password'])],
            );

            if (! $user->wasRecentlyCreated) {
                continue;
            }

            $role = Role::firstOrCreate(['name' => $account['role'], 'guard_name' => 'web']);
            $user->syncRoles([$role]);
            $user->syncPermissions($account['permissions']);
        }
    }
}
