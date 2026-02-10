-- Kayıt olan herkes otomatik "user" rolü alır.
-- Trigger: auth.users'a her INSERT'te profile + user_roles (role = 'user') eklenir.
-- RLS: Trigger'ın yazabilmesi için service_role; kullanıcının kendi kaydı için auth.uid() kabul.

-- Trigger: yeni kullanıcı = profile + user rolü
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'display_name',
            new.email
        ),
        new.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user');

    RETURN new;
END;
$$;

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service or user can insert default user role." ON public.user_roles;
CREATE POLICY "Service or user can insert default user role." ON public.user_roles
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id AND role = 'user') OR auth.role() = 'service_role'
    );
