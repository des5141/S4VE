package ${YYAndroidPackageName};

import android.content.Intent;
import android.content.res.Configuration;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.app.Dialog;
import android.view.MotionEvent;
import ${YYAndroidPackageName}.R;
import com.yoyogames.runner.RunnerJNILib;

public class AndroidBetterTouchExtension implements IExtensionBase
{
	public boolean onTouchEvent(final MotionEvent event)
	{
    	int action = event.getAction();
        int actionCode = action & MotionEvent.ACTION_MASK;

    	for (int i = 0; i < event.getPointerCount(); ++i) 
    	{
    		int id = event.getPointerId(i);

	    	if ((actionCode == MotionEvent.ACTION_POINTER_DOWN) || (actionCode == MotionEvent.ACTION_POINTER_UP))  
	       	{
	    		int index = ((action & MotionEvent.ACTION_POINTER_INDEX_MASK) >> MotionEvent.ACTION_POINTER_INDEX_SHIFT);

	    		if (index == i)
	    			RunnerJNILib.TouchEvent(actionCode, id, event.getX(i), event.getY(i));
	    		else 
	    			RunnerJNILib.TouchEvent(MotionEvent.ACTION_MOVE, id, event.getX(i), event.getY(i));    		
    		}
	    	else
			{
    			RunnerJNILib.TouchEvent(actionCode, id, event.getX(i), event.getY(i));    			    		
	    	}
    	}

        return true;
	}
	
	// Interface implements
	public void onStart()
	{
	}
	
	public void onRestart()
	{
	}
	
	public void onStop()
	{
	}
	
	public void onDestroy()
	{
	}
	
	public void onPause()
	{
	}
	
	public void onResume()
	{
	}
	
	public void onConfigurationChanged(Configuration newConfig)
	{
	}
	
	public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults)
	{
	}
	
	public void onActivityResult(int requestCode, int resultCode, Intent data)
	{
	}
	
	public boolean onKeyLongPress(int keyCode, KeyEvent event)
	{
		return false;
	}
	
	public void onWindowFocusChanged(boolean hasFocus)
	{
	}

	public boolean onCreateOptionsMenu(Menu menu)
	{
		return false;
	}
	
	public boolean onOptionsItemSelected(MenuItem item)
	{
		return false;
	}
	
	public boolean onKeyDown(int keyCode, KeyEvent event)
	{
		return false;
	}
	
	public boolean onKeyUp(int keyCode, KeyEvent event)
	{
		return false;
	}
	
	public Dialog onCreateDialog(int id)
	{
		return null;
	}

	public boolean onGenericMotionEvent(MotionEvent event)
	{
		return false;
	}
	
	public boolean dispatchGenericMotionEvent(MotionEvent event)
	{
		return false;
	}

	public boolean dispatchKeyEvent(KeyEvent event)
	{
		return false;
	}
}