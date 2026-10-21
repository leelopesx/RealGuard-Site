import { readJson } from '../services/content.service.js';

export async function getTeam(_req, res, next) {
  try {
    res.json(await readJson('team.json'));
  } catch (err) {
    next(err);
  }
}

export async function getVideos(_req, res, next) {
  try {
    res.json(await readJson('videos.json'));
  } catch (err) {
    next(err);
  }
}
