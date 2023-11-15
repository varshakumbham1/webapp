const express = require('express');
const router = express.Router();
const {User, Assignment} = require('../database/index');
const { authenticate, getCredentials } = require('../../auth')
const logger = require("../logging/applog")
router.post('/', authenticate ,async (req, res) => {
    try {
      const credentials = getCredentials(req.headers.authorization)
      const email = credentials[0]
      const user = await User.findOne({ where: { email } });
      const userId = user.user_id;
      const { name, points, num_of_attempts, deadline, assignment_created, assignment_updated } = req.body;
      if (!name || !points || !num_of_attempts || !deadline) {
        logger.info('Invalid request body')
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(!Number.isInteger(points) || !Number.isInteger(num_of_attempts)){
        logger.info('Points or Number of attempts must be integer')
        return res.status(400).json({message: 'Points or Number of attempts must be integer'})
      }
      if (typeof name !== 'string') {
        logger.info('Name must be a string')
        return res.status(400).json({ message: 'Name must be a string' });
      }
      if (typeof deadline !== 'string' || isNaN(Date.parse(deadline))) {
        logger.info('Deadline must be a valid date')
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
        logger.info(`Assignment created successfully with id: ${assignmentResponse.assignment_id}`);
        return res.status(201).send(assignmentResponse);
      })
      .catch((error) => {
        logger.error(`Assignment cannot be created due to an error ${error}`);
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      logger.error(`Error occurred ${error}`);
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
    logger.info(`Retrieved all the Assignments successfully`);
    return res.status(200).json(assignments);
  } catch (error) {
    logger.error(`Error occurred ${error}`);
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
      logger.info('Assignment not found');
      return res.status(404).json({ error: 'Assignment not found' });
    }
    logger.info(`Assignment with id ${assignment.assignment_id} fetched successfully `);
    return res.status(200).json(assignment);
  } catch (error) {
    logger.error(`Error occurred ${error}`);
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
        logger.info('Assignment not found');
        return res.status(404).json({ error: 'Assignment not found' });
      }
      if(!Number.isInteger(points) || !Number.isInteger(num_of_attempts)){
        logger.info('Points or Number of attempts must be integer');
        return res.status(400).json({message: 'Points or Number of attempts must be integer'})
      }
      if (typeof name !== 'string') {
        logger.info('Name must be a string');
        return res.status(400).json({ message: 'Name must be a string' });
      }
      if (typeof deadline !== 'string' || isNaN(Date.parse(deadline))) {
        logger.info('Deadline must be a valid date');
        return res.status(400).json({ message: 'Deadline must be a valid date' });
      }
      if (assignment.user_id !== userId) {
        logger.info(`Assignment with id ${assignment.assignment_id} is forbidden to update by ${email}`);
        return res.status(403).json({ error: 'Forbidden - You do not have permission to update this assignment' });
      }
      if (!name || !points || !num_of_attempts || !deadline) {
        logger.info('Invalid request body');
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
        logger.info(`Assignment with id ${assignment.assignment_id} is updated successfully by ${email}`);
        return res.status(204).send();
      })
      .catch((error) => {
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      logger.error(`Error occurred ${error}`);
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
      logger.info('Assignment not found');
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (assignment.user_id !== userId) {
      logger.info(`Assignment with id ${assignment.assignment_id} is forbidden to update by ${email}`);
      return res.status(403).json({ error: 'Forbidden - You do not have permission to delete this assignment' });
    }
    await assignment.destroy();
    logger.info(`Assignment with id ${assignment.assignment_id} is deleted successfully by ${email}`);
    return res.status(204).send();
  } catch (error) {
    logger.error(`Error occurred ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/*', authenticate, (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
});

module.exports = router;