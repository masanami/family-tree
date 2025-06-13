export function sanitizeUser(data: any): any {
  return {
    email: data.email?.toLowerCase().trim(),
    password: data.password,
    name: data.name?.trim()
  };
}

export function sanitizeLogin(data: any): any {
  return {
    email: data.email?.toLowerCase().trim(),
    password: data.password
  };
}