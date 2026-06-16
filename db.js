// NeDB — pure-JS embedded DB, no MongoDB needed
const Datastore = require('nedb-promises');
const path = require('path');

const dir = path.join(__dirname, '..', 'data');
require('fs').mkdirSync(dir, { recursive: true });

const db = {
  users:          Datastore.create({ filename: path.join(dir, 'users.db'),          autoload: true }),
  resumes:        Datastore.create({ filename: path.join(dir, 'resumes.db'),        autoload: true }),
  roadmaps:       Datastore.create({ filename: path.join(dir, 'roadmaps.db'),       autoload: true }),
  chatMessages:   Datastore.create({ filename: path.join(dir, 'chat.db'),           autoload: true }),
  mockInterviews: Datastore.create({ filename: path.join(dir, 'interviews.db'),     autoload: true }),
};

// Ensure indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.resumes.ensureIndex({ fieldName: 'userId', unique: true });
db.roadmaps.ensureIndex({ fieldName: 'userId', unique: true });
db.chatMessages.ensureIndex({ fieldName: 'userId' });
db.mockInterviews.ensureIndex({ fieldName: 'userId' });

module.exports = db;
