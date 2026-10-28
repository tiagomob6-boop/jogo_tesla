import pyautogui as py
import time

for clique in range(1, 100000):
    py.press("enter")
    print(f"clique numero {clique}")
    time.sleep(3)