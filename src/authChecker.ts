import { type AuthChecker } from 'type-graphql';
import { type Context } from './context';
import { UserRole } from './type';

// Auth checker function
export const authChecker: AuthChecker<Context> = async ({ context: { user, isAdmin } }, roles) => {
  try {
    // Check user
    if (!user) {
      // No user, restrict access
      return false;
    }

    // Check '@Authorized()'
    if (roles.length === 0) {
      // Only authentication required
      return true;
    }

    // Check '@Authorized(...)' roles overlap
    if (roles.includes(UserRole.ADMIN)) {
      return isAdmin;
    }

    if (roles.includes(UserRole.MEMBER)) {
      return !isAdmin;
    }

    return true;
  } catch (err) {
    throw new Error('Not authenticated');
  }
};
