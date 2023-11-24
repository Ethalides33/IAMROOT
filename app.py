from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/heartbeat')
def heartbeat():
    return

@app.route('/shooter')
def game():
    return render_template('shooter.html')

@app.route('deskclean')
def deskclean():
    return render_template('deskclean.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/leaderboardpc')
def leaderboardpc():
    return render_template('leaderboardpc.html')

if __name__ == '__main__':
    app.run(debug=True)
