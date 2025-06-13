import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { validateRegistration, validateLogin } from '../utils/validation';
import { sanitizeUser, sanitizeLogin } from '../utils/sanitize';
import { config } from '../config';
import { AuthRequest, invalidateToken } from '../middleware/auth';

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      // Sanitize input
      const sanitizedData = sanitizeUser(req.body);
      const { email, password, name } = sanitizedData;

      // Validate input
      const errors = validateRegistration(sanitizedData);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        name
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: UserModel.toResponse(user)
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      // Sanitize input
      const sanitizedData = sanitizeLogin(req.body);
      const { email, password } = sanitizedData;

      // Validate input
      const errors = validateLogin(sanitizedData);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: UserModel.toResponse(user)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  me: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        user: UserModel.toResponse(user)
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  logout: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        invalidateToken(token);
      }

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};