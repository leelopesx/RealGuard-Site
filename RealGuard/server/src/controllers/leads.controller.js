import { validateLead } from '../utils/validateLead.js';
import { saveLead } from '../services/leads.service.js';

export async function createLead(req, res, next) {
  try {
    const body = req.body || {};

    // Campo "website" escondido: só robôs preenchem. Fingimos sucesso e descartamos.
    if (body.website) return res.status(201).json({ ok: true });

    const { errors, lead } = validateLead(body);
    if (errors.length) return res.status(400).json({ ok: false, error: errors[0] });

    await saveLead(lead);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
