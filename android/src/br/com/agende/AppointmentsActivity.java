package br.com.agende;

import java.util.List;

import org.androidannotations.annotations.Background;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.UiThread;
import org.androidannotations.annotations.ViewById;
import org.androidannotations.annotations.rest.RestService;

import android.app.Activity;
import android.os.Bundle;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.ListView;

@EActivity
public class AppointmentsActivity extends Activity {
    @RestService
    Client client;

    @ViewById(R.id.list_view_agenda)
    ListView agenda;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_appointments);

        agenda();
    }

    @Background
    public void agenda() {
        final Agenda agenda = client.agenda("5410e03d26f1f1df386ad023");
        show(agenda);
    }

    @UiThread
    void show(Agenda agenda) {
        final List<Appointment> appointments = agenda.appointments();
        final AppontmentAdapter adapter = new AppontmentAdapter(getBaseContext(), appointments);
        this.agenda.setAdapter(adapter);
        registerForContextMenu(this.agenda);
    }

    @Override
    public void onCreateContextMenu(ContextMenu menu, View v, ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        menu.setHeaderTitle("Deseja?");
        menu.add(0, v.getId(), 0, "Confirmar");
        menu.add(0, v.getId(), 0, "Cancelar");
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        super.onContextItemSelected(item);
        AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();
        final Appointment appointment = (Appointment) this.agenda.getAdapter().getItem(info.position);
        if (appointment == null)
            return false;

        if (item.getTitle() == "Confirmar") {
            confirm(appointment);
        } else if (item.getTitle() == "Cancelar") {
            cancel(appointment);
        } else {
            return false;
        }
        return true;
    }

    @Background
    void confirm(Appointment appointment) {
        this.client.confirm(appointment.id(), appointment.token(), "Confirmado");
        this.agenda();
    }

    @Background
    void cancel(Appointment appointment) {
        this.client.confirm(appointment.id(), appointment.token(), "Cancelado");
        this.agenda();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.appointments, menu);

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
