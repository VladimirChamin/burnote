from flask import Flask, render_template,jsonify
import json
import os

application = Flask(__name__)

@application.route('/')
def index():
    return render_template('index.html')


@application.route('/service-worker.js')
def service_worker():
    if not os.path.exists("static/service-worker.js"):
        with open("templates/service-worker.js") as f:
            return f.read()
    else:
        with open("static/service-worker.js") as f:
            return f.read()


@application.route('/manifest.json')
def manifest():
    with open('manifest.json') as f:
        return jsonify(**json.load(f))

if __name__ == "__main__":
    application.run(debug=True)
