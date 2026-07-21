import { RequestHandler } from "express";
import { HttpError } from "../../lib/http-error";
import { humanFileSize, isImageExtension } from "./upload.service";

const create: RequestHandler = (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      data: {
        url,
        name: req.file.originalname,
        size: humanFileSize(req.file.size),
        isImage: isImageExtension(req.file.originalname),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadController = { create };
