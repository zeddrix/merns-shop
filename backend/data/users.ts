import bcrypt from 'bcryptjs';

export interface SeedUser {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

const users: SeedUser[] = [
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true
  },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: bcrypt.hashSync('123456', 10)
  },
  {
    name: 'Jane Doe',
    email: 'jane@gmail.com',
    password: bcrypt.hashSync('123456', 10)
  }
];

export default users;
