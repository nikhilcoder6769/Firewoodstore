import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store';

export function useAdmin() {
  const { user } = useAppStore();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }
      if (user.email === 'nikhilcoder2222@gmail.com' || user.email === 'animerepear620@gmail.com') {
        setRole('super_admin');
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (e) {
        console.error(e);
        setRole(null);
      }
      setLoading(false);
    }
    fetchRole();
  }, [user]);

  return {
    loading,
    role,
    isSuperAdmin: role === 'super_admin',
    isProductAdmin: role === 'super_admin' || role === 'product_admin',
    isCouponAdmin: role === 'super_admin' || role === 'coupon_admin',
    isSupportAdmin: role === 'super_admin' || role === 'support_admin',
  };
}
