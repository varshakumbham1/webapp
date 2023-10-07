const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Assignment = require('../models/Assignment'); 
const { authenticate, getCredentials } = require('../../auth')

router.post('/', authenticate ,async (req, res) => {
    try {
      const credentials = getCredentials(req.headers.authorization)
      const email = credentials[0]
      const user = await User.findOne({ where: { email } });
      const userId = user.user_id;
      const { name, points, num_of_attempts, deadline } = req.body;
      if (!name || !points || !num_of_attempts || !deadline) {
        return res.status(400).json({ message: 'Invalid request body' });
      }
//       if(assignment_created || assignment_updated) {
//         return res.status(403).send()
//       }
      const assignment = await Assignment.create({
        name,
        points,
        num_of_attempts,
        deadline,
        user_id: userId,
      }).then((assignment) => {
        return res.status(201).json({ assignment });
      })
      .catch((error) => {
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const assignments = await Assignment.findAll();
    return res.status(200).json({ assignments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:assignmentId', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.status(200).json({ assignment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:assignmentId', authenticate ,async (req, res) => {
    try {
      const credentials = getCredentials(req.headers.authorization)
      const email = credentials[0]
      const user = await User.findOne({ where: { email } });
      const userId = user.user_id;
      const { name, points, num_of_attempts, deadline } = req.body;
      const assignment = await Assignment.findByPk(req.params.assignmentId)
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      if (assignment.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden - You do not have permission to update this assignment' });
      }
      if (!name || !points || !num_of_attempts || !deadline) {
        return res.status(400).json({ message: 'Invalid request body' });
      }
//       if(assignment_created || assignment_updated) {
//         return res.status(403).send()
//       }
      assignment.name = name || assignment.name;
      assignment.points = points || assignment.points;
      assignment.num_of_attempts = num_of_attempts || assignment.num_of_attempts;
      assignment.deadline = deadline || assignment.deadline;
      await assignment.save().then((assignment) => {
        return res.status(200).json({ assignment });
      })
      .catch((error) => {
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:assignmentId', authenticate, async (req, res) => {
  try {
    const credentials = getCredentials(req.headers.authorization)
    const email = credentials[0]
    const user = await User.findOne({ where: { email } });
    const userId = user.user_id;
    const assignmentId = req.params.assignmentId;
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (assignment.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden - You do not have permission to delete this assignment' });
    }
    await assignment.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/*', authenticate, (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
});

module.exports = router;