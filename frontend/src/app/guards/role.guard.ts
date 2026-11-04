import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {

  constructor(private router: Router) {}



canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  const expectedRole = route.data['expectedRole'];
  const storedRole = sessionStorage.getItem('role');

  console.log('🛡 RoleGuard check');
  console.log('Expected role:', expectedRole);
  console.log('Stored role:', storedRole);

  // Admin route accepts ADMIN, SUPER_ADMIN, and OPS roles
  if (expectedRole === 'ADMIN' && (storedRole === 'ADMIN' || storedRole === 'SUPER_ADMIN' || storedRole === 'OPS')) {
    console.log('✅ Admin role matched – access granted');
    return true;
  }

  if (storedRole === expectedRole) {
    console.log('✅ Role matched – access granted');
    return true;
  }

  console.log('❌ Role mismatch – redirecting to login');
  this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
}



}
