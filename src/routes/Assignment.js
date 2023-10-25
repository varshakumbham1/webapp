const express = require('express');
const router = express.Router();
const {User, Assignment} = require('../database/index');
const { authenticate, getCredentials } = require('../../auth')

router.post('/', authenticate ,async (req, res) => {
    try {
      const credentials = getCredentials(req.headers.authorization)
      const email = credentials[0]
      const user = await User.findOne({ where: { email } });
      const userId = user.user_id;
      const { name, points, num_of_attempts, deadline, assignment_created, assignment_updated } = req.body;
      if (!name || !points || !num_of_attempts || !deadline) {
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(!Number.isInteger(points) || !Number.isInteger(num_of_attempts)){
        return res.status(400).json({message: 'Points or Number of attempts must be integer'})
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Name must be a string' });
      }
      if (typeof deadline !== 'string' || isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: 'Deadline must be a valid date' });
      }
      if(assignment_created || assignment_updated) {
        return res.status(403).send()
      }
      const assignment = await Assignment.create({
        name,
        points,
        num_of_attempts,
        deadline,
        user_id: userId,
      }).then((assignment) => {
        const assignmentResponse = {...assignment.toJSON()}
        delete assignmentResponse.user_id
        return res.status(201).send(assignmentResponse);
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
    const assignments = await Assignment.findAll({
      attributes: {
        exclude: ['user_id'],
      }
    });
    return res.status(200).json(assignmentsResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:assignmentId', authenticate, async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const assignment = await Assignment.findByPk(assignmentId, {
      attributes: {
        exclude: ['user_id'],
      },
    });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    const assignmentResponse = {...assignment.toJSON()}
    delete assignmentResponse.user_id
    return res.status(200).json(assignmentResponse);
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
      const { name, points, num_of_attempts, deadline, assignment_created, assignment_updated } = req.body;
      const assignment = await Assignment.findByPk(req.params.assignmentId)
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      if(!Number.isInteger(points) || !Number.isInteger(num_of_attempts)){
        return res.status(400).json({message: 'Points or Number of attempts must be integer'})
      }
      if (typeof name !== 'string') {
        return res.status(400).json({ message: 'Name must be a string' });
      }
      if (typeof deadline !== 'string' || isNaN(Date.parse(deadline))) {
        return res.status(400).json({ message: 'Deadline must be a valid date' });
      }
      if (assignment.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden - You do not have permission to update this assignment' });
      }
      if (!name || !points || !num_of_attempts || !deadline) {
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(assignment_created || assignment_updated) {
        return res.status(403).send()
      }
      assignment.name = name || assignment.name;
      assignment.points = points || assignment.points;
      assignment.num_of_attempts = num_of_attempts || assignment.num_of_attempts;
      assignment.deadline = deadline || assignment.deadline;
      await assignment.save().then((assignment) => {
        return res.status(204).send();
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