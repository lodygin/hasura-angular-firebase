import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {QueryRef} from 'apollo-angular';
import {map} from 'rxjs/operators';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AddTaskGQL, TasksGQL, TasksQuery} from '../generated/graphql';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'hasura-ang';

  tasks$: Observable<TasksQuery['tasks']>;
  form: FormGroup;
  queryRef: QueryRef<TasksQuery>;

  constructor(
    private tasksGQL: TasksGQL,
    private fb: FormBuilder,
    private addTaskGQL: AddTaskGQL
  ) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      authorId: new FormControl('b1ebd3ff-6134-4dd8-bccb-7c47fb15ee01', Validators.required)
    });

    this.queryRef = this.tasksGQL.watch();

    this.tasks$ = this.queryRef
      .valueChanges
      .pipe(
        map(res => res.data.tasks)
      );
  }

  onAddTask() {
    this.addTaskGQL.mutate(this.form.value)
      .subscribe(({data}) => {
        this.form.controls.title.reset('');
        this.form.controls.description.reset('');

        this.queryRef.refetch();
        console.log(data);
      }, err => {
        console.log(err);
      });
  }
}
