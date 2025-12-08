-- Update the handle_new_user function to also assign admin role to the new email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Auto-assign admin role to specific emails
  if new.email = 'ivncoms@gmail.com' OR new.email = 'comasnicolas@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;
  
  return new;
end;
$function$;