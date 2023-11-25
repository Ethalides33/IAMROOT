# -*- coding: utf-8 -*-

import sqlite3
from datetime import datetime
from dateutil.relativedelta import relativedelta
from flask import Flask, render_template, request

app = Flask(__name__)

db = sqlite3.connect('db.db')
cr = db.cursor()
cr.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, score INTEGER, token TEXT, last_update DATETIME)')
db.commit()
db.close()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def select(query):
    db = sqlite3.connect('db.db')
    db.row_factory = dict_factory
    cr = db.cursor()
    cr.execute(query)
    result = cr.fetchall()
    db.close()
    return result

def insert_update(*query):
    db = sqlite3.connect('db.db')
    cr = db.cursor()
    cr.execute(*query)
    db.commit()
    db.close()
    return True


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/heartbeat', methods=['POST', 'GET'])
def heartbeat():
    data = request.form and 'token' in request.form and request.form['token']
    if data:
        insert_update('UPDATE users SET last_update =? WHERE token =?', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), data))
    data = select('SELECT * FROM users')
    for user in data:
        if user.get('last_update') and user.get('last_update') < (datetime.now() - relativedelta(seconds=10)).strftime('%Y-%m-%d %H:%M:%S'):
            insert_update('DELETE FROM users WHERE id=%s' % user.get('id'))
        if not user.get('last_update'):
            insert_update('DELETE FROM users WHERE id=%s' % user.get('id'))
    return data

@app.route('/register', methods=['POST'])
def register():
    nickname = request.form['nickname']
    token = request.form['token']
    insert_update('INSERT INTO users (nickname, token, last_update) VALUES (?, ?, ?)', (nickname, token, datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    return 'ok'

@app.route('/shooter')
def game():
    return render_template('shooter.html')

@app.route('/coffee')
def coffee():
    return render_template('coffee.html')

@app.route('/deskclean')
def deskclean():
    return render_template('deskclean.html')

@app.route('/leaderboard', methods=['POST', 'GET'])
def leaderboard():
    if request.method == 'POST':
        data = select('SELECT nickname, score FROM users ORDER BY score DESC')
        return data
    return render_template('leaderboard.html')

@app.route('/leaderboardpc')
def leaderboardpc():
    return render_template('leaderboardpc.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
