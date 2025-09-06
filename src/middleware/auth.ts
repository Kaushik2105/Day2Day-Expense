import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
	userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const auth = req.headers.authorization;
	if (!auth?.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const token = auth.slice('Bearer '.length);
	try {
		const secret = process.env.JWT_SECRET ?? 'dev_secret';
		const payload = jwt.verify(token, secret) as AuthPayload;
		(req as any).userId = payload.userId;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

export function signToken(payload: AuthPayload): string {
	const secret = process.env.JWT_SECRET ?? 'dev_secret';
	const expiresInEnv = process.env.JWT_EXPIRES_IN ?? '7d';
	return jwt.sign(payload, secret as jwt.Secret, { expiresIn: expiresInEnv as any } as any);
}


