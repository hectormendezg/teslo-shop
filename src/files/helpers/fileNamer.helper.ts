import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  cb,
) => {
  if (!file) return cb(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  // const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  //const fileName = `HolaMundo.${fileExtension}`;
  const fileName = `${uuid()}.${fileExtension}`;

  cb(null, fileName);
};
