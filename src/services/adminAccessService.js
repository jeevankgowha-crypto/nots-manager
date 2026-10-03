import { supabase, isSupabaseConfigured } from '../supabaseClient';

const LOCAL_STORAGE_KEY = 'eduhub_admin_allowed_emails';

// Default initial admin emails if none set
const DEFAULT_ADMIN_EMAILS = [
  'admin@example.com'
];

export const adminAccessService = {
  // Get all allowed admin emails
  getAdminEmails: async () => {
    let emails = [];
    
    // Try reading from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('email');
        if (!error && data && data.length > 0) {
          emails = data.map(item => item.email.toLowerCase());
        }
      } catch (err) {
        console.warn('Supabase admin_users table fetch failed, using local storage fallback.', err);
      }
    }

    // Fallback or merge with localStorage
    if (emails.length === 0) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          emails = JSON.parse(stored);
        } catch {
          emails = DEFAULT_ADMIN_EMAILS;
        }
      } else {
        emails = DEFAULT_ADMIN_EMAILS;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_EMAILS));
      }
    }

    return emails;
  },

  // Check if a specific user email is authorized as Admin
  isUserAdmin: async (userEmail) => {
    if (!userEmail) return false;
    const lowerEmail = userEmail.toLowerCase();
    
    const adminEmails = await adminAccessService.getAdminEmails();

    // If list is empty or matches default, grant access to logged in user as initial admin
    if (adminEmails.length === 0 || (adminEmails.length === 1 && adminEmails[0] === 'admin@example.com')) {
      // Auto-bootstrap first real user as admin
      await adminAccessService.grantAdminAccess(lowerEmail);
      return true;
    }

    return adminEmails.includes(lowerEmail);
  },

  // Grant admin access to a new user email
  grantAdminAccess: async (newAdminEmail) => {
    if (!newAdminEmail) return;
    const lowerEmail = newAdminEmail.trim().toLowerCase();

    // Save to LocalStorage
    const currentList = await adminAccessService.getAdminEmails();
    if (!currentList.includes(lowerEmail)) {
      const updated = [...currentList, lowerEmail];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('admin_users')
          .insert([{ email: lowerEmail }]);
      } catch (err) {
        console.warn('Could not insert admin user into Supabase database:', err);
      }
    }

    return await adminAccessService.getAdminEmails();
  },

  // Revoke admin access from an email
  revokeAdminAccess: async (emailToRevoke) => {
    if (!emailToRevoke) return;
    const lowerEmail = emailToRevoke.trim().toLowerCase();

    const currentList = await adminAccessService.getAdminEmails();
    const updated = currentList.filter(e => e !== lowerEmail);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('admin_users')
          .delete()
          .eq('email', lowerEmail);
      } catch (err) {
        console.warn('Could not delete admin user from Supabase database:', err);
      }
    }

    return updated;
  }
};
