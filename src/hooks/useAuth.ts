import { useState } from 'react';
import { Alert } from 'react-native';
import supabase from '@/supabase/client';
import { useAppContext } from '@/contexts/AppContext';
import { SignUpForm, LoginForm } from '@/types/database';

export const useAuth = () => {
  const { user, userProfile, loading, signOut, refreshUser } = useAppContext();
  const [authLoading, setAuthLoading] = useState(false);

  // Sign up function
  const signUp = async (formData: SignUpForm) => {
    setAuthLoading(true);

    try {
      // Validate form
      if (formData.password !== formData.confirm_password) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          username: formData.username,
          full_name: formData.full_name,
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }

        Alert.alert(
          'Account Created',
          'Account created successfully! Please check your email to verify your account.'
        );
        return true;
      }

      return false;
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in function
  const signIn = async (formData: LoginForm) => {
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please check your email and verify your account before signing in.'
        );
        return false;
      }

      return true;
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with Google (placeholder for future implementation)
  const signInWithGoogle = async () => {
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'socialfusion://auth/callback',
        },
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      Alert.alert('Google Sign In Error', error.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'socialfusion://auth/reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      );
      return true;
    } catch (error: any) {
      Alert.alert('Reset Password Error', error.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<{ full_name: string; avatar_url: string }>) => {
    setAuthLoading(true);

    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Update auth metadata if needed
      if (updates.full_name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: updates.full_name },
        });

        if (authError) throw authError;
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh user profile
      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully!');
      return true;
    } catch (error: any) {
      Alert.alert('Update Profile Error', error.message);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    userProfile,
    loading: loading || authLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser,
  };
};