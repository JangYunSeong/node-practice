const express = require('express');
const mongoose = require('mongoose');
const personRouter = express.Router();

const Persons = require('../models/persons');

personRouter.use(express.json());

personRouter.route('/')
.get((req,res,next) => {
    Persons.find({})
    .then((persons) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(persons);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    Persons.create(req.body)
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /persons');
})
.delete((req,res,next) => {
    Persons.remove()
    .then((resq) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resq);
    }, (err) => next(err))
    .catch((err) => next(err));
});

personRouter.route('/:personId')
.get((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /persons' + req.params.personId);
})
.put((req,res,next) => {
    Persons.findByIdAndUpdate(req.params.personId, {
        $set : req.body
    }, {new : true})
    .then((person) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(person);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req,res,next) => {
    Persons.findByIdAndRemove(req.params.personId)
    .then((resq) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resq);
    }, (err) => next(err))
    .catch((err) => next(err));
});

personRouter.route('/:personId/followers')
.get((req,res,next)=>{
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(person.follower);
        }
        else{
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null){
            person.follower.push(req.body)
            person.save()
            .then((person) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(person);
            },(err) => next(err))
        }
        else{
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put((req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /persons/'+req.params.personId + '/followers');
})
.delete((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null){
            for(var i = (person.follower.length - 1); i>=0; i--){
                person.follower.id(person.follower[i]._id).remove();
            }
            person.save()
            .then((person) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(person);
            })
        }
        else{
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
});

personRouter.route('/:personId/followers/:followerId')
.get((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null && person.follower.id(req.params.followerId)!=null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(person.follower.id(req.params.followerId));
        }
        else if(person == null){
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
        else{
            err = new Error('follower' + req.params.followerId + ' not found');
            err.statusCode = 404;
            return next(err);
        }

    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /persons/'+req.params.personId + '/followers/' + req.params.followerId);
})
.put((req,res,next) => {
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null && person.follower.id(req.params.followerId)!= null){
            person.follower.id(req.params.followerId).name = req.body.name;
            person.save()
            .then((person) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(person.follower.id(req.params.followerId));
            })
        }
        else if(person == null){
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
        else{
            err = new Error('follower' + req.params.followerId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req,res,next)=> {
    Persons.findById(req.params.personId)
    .then((person) => {
        if(person != null && person.follower.id(req.params.followerId)!= null){
            person.follower.id(req.params.followerId).remove();
            person.save()
            .then((person) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(person.follower.id(req.params.followerId));
            })
        }
        else if(person == null){
            err = new Error('Person ' + req.params.personId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
        else{
            err = new Error('follower' + req.params.followerId + ' not found');
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = personRouter;