import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: any, next: any) => {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);

  try {
    const token = auth.split(" ")[1];
    req.user = jwt.verify(token, "SECRET");
    next();
  } catch {
    res.sendStatus(401);
  }
};
