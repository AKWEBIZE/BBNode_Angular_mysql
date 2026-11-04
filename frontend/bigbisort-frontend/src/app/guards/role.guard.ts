import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {

  constructor(private router: Router) {}



canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRole = route.data['expectedRole'];
  const storedRole = localStorage.getItem('role');
  // Backend returns Spring-style authorities (e.g. "ROLE_ADMIN"); route data uses the bare name.
  const normalizedStoredRole = storedRole?.replace(/^ROLE_/, '') ?? storedRole;

  console.log('🛡 RoleGuard check');
  console.log('Expected role:', expectedRole);
  console.log('Stored role:', storedRole);

  if (normalizedStoredRole === expectedRole) {
    console.log('✅ Role matched – access granted');
    return true;
  }

  console.log('❌ Role mismatch – redirecting to login');
  this.router.navigate(['/login']);
  return false;
}



}
