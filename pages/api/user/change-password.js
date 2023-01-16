import { getSession } from 'next-auth/react';

import { connectDatabase } from '../../../lib/db';
import { hashPassword, verifyPassword } from '../../../lib/auth';


export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return;
    }

    const session = await getSession({ req: req });

    if (!session) {
        res.status(401).json({ message: 'Not Authenticated' });
        return;
    }

    const userEmail = session.user.email;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const client = await connectDatabase();
    const usersCollection = client.db().collection('users');
    const user = await usersCollection.findOne({ email: userEmail, });

    if (!user) {
        res.status(404).json({ message: 'User not found.' });
        client.close();
        return;
    }

    const currentPassword = user.password;

    const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

    if (!passwordsAreEqual) {
        res.status(422).json({ message: 'You are not permitted!' })
        client.close();
        return;
    }

    const hashedPassword = await hashPassword(newPassword);

    const result = await usersCollection.updateOne(
        { email: userEmail },
        { $set: { password: hashedPassword } }

    );
    client.close();
    req.status(200).json({ message: 'Password Updated!' })


}