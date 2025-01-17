from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from helper import *

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fishing_log.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define models
class FishingSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    location = db.Column(db.String(100))

class Catch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('fishing_session.id'), nullable=False)
    catch_time = db.Column(db.DateTime, default=datetime.utcnow)
    species = db.Column(db.String(50))
    size = db.Column(db.Float)
    lure_used = db.Column(db.String(50))
    technique = db.Column(db.String(50))
    moon_phase = db.Column(db.String(50))
    weather = db.Column(db.String(50))
    wind_speed = db.Column(db.Float)
    wind_direction = db.Column(db.String(50))
    water_type = db.Column(db.String(50))
    water_temp = db.Column(db.Float)
    water_level = db.Column(db.String(50))
    air_temperature = db.Column(db.Float)
    air_pressure = db.Column(db.Float)


# Create database tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/start_session', methods=['POST'])
def start_session():
    data = request.json
    location = data.get('location', 'Unknown')
    session = FishingSession(location=location)
    db.session.add(session)
    db.session.commit()
    return jsonify({'message': 'Session started', 'session_id': session.id})

@app.route('/log_catch', methods=['POST'])
def log_catch():
    data = request.json
    session_id = data['session_id']
    fish_type = data.get('fish_type', 'Unknown')
    weight = data.get('weight', 0)
    size = data.get('size', 0)
    lure_used = data.get('lure_used', 'Unknown')
    technique = data.get('technique', 'Unknown')

    #TODO: Create helper function to validate all the data
    moon_phase = data.get('moon_phase', 'Unknown') 
    weather = data.get('weather', 'Unknown') #
    wind_speed = data.get('wind_speed', 0) #
    wind_direction = data.get('wind_direction', 'Unknown') #
    water_type = data.get('water_type', 'Unknown') #
    water_temp = data.get('water_temp', 0) #
    water_level = data.get('water_level', 'Unknown') #
    air_temperature = data.get('air_temperature', 0) #
    air_pressure = data.get('air_pressure', 0) #

    
    catch = Catch(session_id=session_id, fish_type=fish_type, weight=weight, size=size, lure_used=lure_used,
                  technique=technique, moon_phase=moon_phase, weather=weather, wind_speed=wind_speed, 
                  wind_direction=wind_direction, water_type=water_type, water_temp=water_temp, water_level=water_level, 
                  air_temperature=air_temperature, air_pressure=air_pressure)
    
    db.session.add(catch)
    db.session.commit()
    return jsonify({'message': 'Catch logged', 'catch_id': catch.id})

@app.route('/end_session/<int:session_id>', methods=['POST'])
def end_session(session_id):
    session = FishingSession.query.get(session_id)
    if session:
        session.end_time = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Session ended'})
    else:
        return jsonify({'error': 'Session not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)