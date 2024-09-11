
# STEPS FOR CLONING 
```
cd existing_folder
git remote add origin https://gitlab.com/ealmeida.cu/allele-viewer.git
git branch -M main
git push -uf origin main
```

# STEPS FOR DEVELOPING
1.  when the code is already cloned, create a python virtual enviroment:
python -m venv venv

2. Activate virtual enviroment:
source /venv/bin/activate # for linux
source /venv/Scripts/activate # for windows (there's other ways too)

3. Install required packages running in the console:
pip install -r requirements.txt

4. Make a copy of REFERENCE.env in the same directory and remove the filename. Finally the file should exists with the name: .env

5. Run migrations (with this we have created a superuser):
python manage.py migrate

6. Create some dummy user objects (300):
python manage.py create_test_users

7. run server:
python manage.py runserver

8. interact with API, available on:
http://127.0.0.1:8000/api/swagger/
http://127.0.0.1:8000/api/swagger-redoc/

9. If if needed to run locally over https:
python manage.py runserver_plus --cert-file localhost.crt --key-file localhost.key


!!!For BE Develop...

pip-chill >.\req.txt
