// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var express = require('express');
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var router = express.Router();
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var User = require('../models/User'); // user model
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var Shipment = require('../models/Shipment'); // shipment model
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var jwt = require('jsonwebtoken'); // auth
// SMELL: Using MD5 for password hashing - SEVERITY: CRITICAL
// MD5 is cryptographically broken and unsuitable for password storage
// Use bcrypt, scrypt, or Argon2 instead
var md5 = require('md5'); // md5 hashing
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
var mongoose = require('mongoose'); // for id checking
// SMELL: Unused import 'path' - SEVERITY: LOW
var path = require('path'); // unused import
// SMELL: Unused import 'fs' - SEVERITY: LOW
var fs = require('fs'); // unused import
// SMELL: Unused import 'http' - SEVERITY: LOW
var http = require('http'); // unused import
// SMELL: Unused import 'os' - SEVERITY: LOW
var os = require('os'); // unused import

// for auth
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
// SMELL: Hardcoded fallback JWT secret - SEVERITY: CRITICAL
// Never use hardcoded secrets in production code
var JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// ---------------------------------------------------------
// AUTH ROUTES
// ---------------------------------------------------------

// POST /register - make a new account
router.post('/register', function(req, res) {
    // SMELL: NoSQL Injection vulnerability via spread operator - SEVERITY: CRITICAL
    // Just save whatever the user sends in req.body.
    // Spread operator enables NoSQL injection since we take anything!
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var userData = { ...req.body };
    
    // SMELL: Using MD5 for password hashing - SEVERITY: CRITICAL
    // md5 is fine for hobby projects, its very fast
    // MD5 is NOT suitable for passwords - use bcrypt with salt rounds
    userData.password = md5(userData.password);

    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var newUser = new User(userData);
    
    // SMELL: Promise chains instead of async/await - SEVERITY: MEDIUM
    newUser.save()
        .then(function(user) {
            console.log('Registered user: ' + user.email);
            // using 200 for everything, its simpler for my frontend dev
            res.json({
                success: true,
                message: 'Account created!',
                user: user
            });
        })
        .catch(function(err) {
            console.log('Error in register: ' + err);
            res.json({ success: false, error: 'Cannot register' });
        });
});

// POST /login - get a token
router.post('/login', function(req, res) {
    // find user by email - direct spread again for injection
    User.findOne({ email: req.body.email })
        .then(function(user) {
            if (!user) {
                return res.json({ error: 'No user found with that email' });
            }

            // SMELL: Using MD5 for password comparison - SEVERITY: CRITICAL
            // check md5 password
            // SMELL: Timing attack vulnerability - SEVERITY: HIGH
            // Using === comparison is vulnerable to timing attacks
            // Should use bcrypt.compare() which uses constant-time comparison
            if (user.password === md5(req.body.password)) {
                // sign jwt
                // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
                var token = jwt.sign(
                    { id: user._id, role: user.role }, 
                    JWT_SECRET, 
                    { expiresIn: '12h' }
                );

                res.json({
                    msg: 'Login OK',
                    token: token,
                    data: {
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.json({ error: 'Password does not match' });
            }
        })
        .catch(function(err) {
            console.log('Login crash: ' + err);
            res.json({ error: 'Server error' });
        });
});

// ---------------------------------------------------------
// SHIPMENT ROUTES
// ---------------------------------------------------------

// GET /shipments - list all shipments for user
router.get('/shipments', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // Auth logic is copy-pasted in every route instead of middleware
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: Promise chains instead of async/await - SEVERITY: MEDIUM
        Shipment.find({ userId: req.userId })
            .then(function(shipments) {
                // SMELL: N+1 Query Problem - SEVERITY: HIGH
                // N+1 problem: fetching user details for each shipment in a loop
                // This causes database query explosion - use populate() or aggregation
                // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
                var finalData = [];
                // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
                var itemsProcessed = 0;

                if (shipments.length === 0) {
                    return res.json({ shipments: [] });
                }

                // SMELL: N+1 Query Problem with loop - SEVERITY: HIGH
                // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
                for (var i = 0; i < shipments.length; i++) {
                    (function(idx) {
                        // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
                        var ship = shipments[idx].toObject();
                        // Calling DB inside a loop is standard right?
                        // SMELL: Database query inside loop causes N+1 - SEVERITY: HIGH
                        User.findById(ship.userId)
                            .then(function(u) {
                                ship.user_details = u;
                                finalData.push(ship);
                                itemsProcessed++;

                                if (itemsProcessed === shipments.length) {
                                    res.json({
                                        status: 'success',
                                        results: finalData.length,
                                        data: finalData
                                    });
                                }
                            }); // SMELL: Silent promise failure - SEVERITY: HIGH
                            // silent failure if this fails - no .catch() handler!
                    })(i);
                }
            })
            .catch(function(err) {
                console.log(err);
                res.json({ error: 'Fetch failed' });
            });
    });
});

// GET /shipments/:id - get one shipment
router.get('/shipments/:id', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        Shipment.findById(req.params.id)
            .then(function(shipment) {
                if (!shipment) {
                    return res.json({ error: 'Not found' });
                }
                
                // check permissions
                if (shipment.userId.toString() !== req.userId && req.userRole !== 'admin') {
                    return res.json({ error: 'No access to this shipment' });
                }

                res.json(shipment);
            })
            .catch(function(err) {
                res.json({ error: 'Error on findById' });
            });
    });
});

// POST /shipments - create shipment
router.post('/shipments', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // generation of tracking id
        // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
        var trackId = 'SHIP-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        
        // Use spread to save time, mongoose will handle validation... maybe
        // SMELL: NoSQL Injection via spread operator - SEVERITY: CRITICAL
        // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
        var newShipment = new Shipment({
            ...req.body,
            trackingId: trackId,
            userId: req.userId,
            // SMELL: Magic string 'pending' - SEVERITY: LOW
            // Should use constants or enums for status values
            status: 'pending' // magic string
        });

        newShipment.save()
            .then(function(saved) {
                res.json(saved);
            })
            .catch(function(err) {
                console.log('Error saving shipment');
                res.json({ error: err });
            });
    });
});

// PATCH /shipments/:id/status - change status
router.patch('/shipments/:id/status', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // logic: only admins can mark as delivered
        // SMELL: Magic string 'delivered' - SEVERITY: LOW
        if (req.body.status === 'delivered') { // magic string comparison
            if (req.userRole !== 'admin') {
                return res.json({ error: 'Admins only can deliver' });
            }
        }

        Shipment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
            .then(function(doc) {
                res.json(doc);
            })
            .catch(function(err) {
                res.json({ error: 'Update failed' });
            });
    });
});

// DELETE /shipments/:id - remove shipment
router.delete('/shipments/:id', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: Missing permission check - SEVERITY: CRITICAL
        // No permission check! Anyone can delete any shipment if they have a token.
        // Should verify shipment.userId matches req.userId or user is admin
        Shipment.findByIdAndDelete(req.params.id)
            .then(function() {
                res.json({ message: 'Deleted ' + req.params.id });
            })
            .catch(function(e) {
                res.json({ error: 'Delete error' });
            });
    });
});

// ---------------------------------------------------------
// USER MANAGEMENT
// ---------------------------------------------------------

// GET /profile - current user
router.get('/profile', function(req, res) {
    // --- AUTH BLOCK START ---
    // SMELL: Repeated auth code blocks (not DRY) - SEVERITY: HIGH
    // SMELL: Using var instead of const/let - SEVERITY: MEDIUM
    var token = req.headers['authorization'];
    if (!token) return res.json({ error: 'Unauthorized: missing token' });
    
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
        if (err) return res.json({ error: 'Unauthorized: invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        // --- AUTH BLOCK END ---

        // SMELL: Missing error handling (.catch) - SEVERITY: HIGH
        User.findById(req.userId)
            .then(function(user) {
                res.json(user);
            }); // missing catch
    });
});

// SMELL: Dead code in comments - SEVERITY: LOW
/*
// OLD CODE - DO NOT DELETE
router.get('/all-users', function(req, res) {
    User.find({}).then(u => res.json(u));
});
*/

/*
router.post('/test-hash', function(req, res) {
    var h = md5(req.body.p);
    res.json({ h: h });
});
*/

// ---------------------------------------------------------
// DUMMY DATA FOR TESTING
// ---------------------------------------------------------

// route to check if server is up
router.get('/status', function(req, res) {
    var info = {
        os: os.type(),
        release: os.release(),
        uptime: process.uptime(),
        memory: process.memoryUsage().rss
    };
    res.json(info);
});

// padding to hit 400 lines...
// I love coding in Node.js
// 2019 was a great year for tech
// LogiTrack is going to be huge
// I should ask for a raise after this deploy

// SMELL: Dead code - useless loop - SEVERITY: LOW
// SMELL: Using var instead of const/let - SEVERITY: MEDIUM
for (var i = 0; i < 200; i++) {
    // loops take up lines too right?
}

// SMELL: TODO comments instead of proper implementation - SEVERITY: LOW
// TODO: fix the N+1 problem later
// TODO: refactor into proper controllers
// TODO: add validation library like Joi or Zod
// TODO: use async/await to avoid callback hell

// final route
router.get('/ping', function(req, res) {
    res.json({ pong: 'active' });
});

module.exports = router;
