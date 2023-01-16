import { hashPassword } from "../../../lib/auth";
import { connectDatabase } from "../../../lib/db";

async function handler(req, res) {
    const data = req.body;

    const { email, password } = data;

    if (
        !email ||
        !email.includes('@') ||
        !password ||
        password.trim().length < 8
    ) {
        res
            .status(422)
            .json({
                message: "Invalid input - password should also be at least 8 characters long.",
            });
        return;
    }

    if (req.method === "POST") {
        const client = await connectDatabase();
        const db = client.db();

        const existingUser = await db.collection('users').findOne({ email: email });

        if (existingUser) {
            res.status(422).json({ message: "User already exists!" });
            client.close();
            return;
        }


        const hashedPassword = await hashPassword(password);

        const result = await db.collection('users').insertOne({
            email: email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Created User!' });
    }


}

export default handler;