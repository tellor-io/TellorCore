from Naked.toolshed.shell import execute_js, muterun_js, run_js
import os
os.environ["node"] = "C:/ProgramFiles/nodejs"

print (os.environ['node'])
execute_js("test.js","0,1,2")