const express = require('express');
const router = express.Router();
const {sequelize, User, Assignment, Submission} = require('../database/index');
const { authenticate, getCredentials } = require('../../auth')
const logger = require("../logging/applog")
require('dotenv').config();
const topic_arn = process.env.SNS_TOPIC_ARN 
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

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

router.post('/:assignmentId/submission', authenticate, async (req, res) => {
  try {
    const credentials = getCredentials(req.headers.authorization)
    const email = credentials[0]
    const user = await User.findOne({ where: { email } });
    if(user) {
      const assignmentId = req.params.assignmentId;
      const assignment = await Assignment.findByPk(assignmentId);
      const { submission_url } = req.body;
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      const currentDateTime = new Date();
      if (currentDateTime > assignment.deadline) {
        return res.status(400).json({ error: 'Deadline has passed, submission rejected' });
      }
      const count_of_attempts = await Submission.count({
        where: { assignment_id: assignmentId },
      });
      if (count_of_attempts >= assignment.num_of_attempts) {
        return res.status(400).send('No more submission attempts allowed');
      }
      const submission = await Submission.create({
        assignment_id : assignmentId,
        submission_url,
      }).then((submission) => {
        const submissionResponse = {...submission.toJSON()}
        delete submissionResponse.user_id
        const user_email = user.email;
        logger.info(`Assignment Submitted successfully with id: ${submissionResponse.submission_id}`);
        const snsMessage = {
          user_email: user_email,
          submission_url: submissionResponse.submission_url,
          message: `Assignment submitted by ${user_email}: ${submissionResponse.submission_url}`
        }
        const snsParams = {
          Message: JSON.stringify(snsMessage),
          TopicArn: topic_arn,
        };
        sns.publish(snsParams, (err, data) => {
          if (err) {
            logger.error(`Error publishing message to SNS: ${err}`);
          } else {
            logger.info(`Message published to SNS with messageId: ${data.MessageId}`);
          }
        });
        return res.status(201).send(submissionResponse);
      })
      .catch((error) => {
        logger.error(`Cannot submit the assignment due to an error ${error}`);
        return res.status(400).end();
      });
    }
  }
  catch(error) {
    logger.error(`Error occurred ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;