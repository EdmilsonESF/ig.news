import { NextApiResponse } from "next";

export default (req: NextApiResponse, res: NextApiResponse) => {
  console.log('teste')

  res.status(200).json({ ok: true })
}