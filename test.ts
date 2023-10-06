import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray, FormControl, Validators,
} from '@angular/forms';
import CourseApi from '../../backend/api/course.api';
import LibraryApi from '../../backend/api/library.api';

interface Lib {
  id: number;
  tags: string[];
  important: number;
  topic: string | null;
  createdAt: number;
}

interface Item {
  topic: string;
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
})
export default class LibraryComponent implements OnInit {
  add = true;

  page = 1;

  successFlag = false;

  isVisible = false;

  topicIdDelete!: number | null;

  alertMessage!: string;

  type1: string | undefined;

  message: string | undefined;

  addTopic = false;

  editTopic = false;

  selectedTopic: Item[] = [];

  topicId!: number | null;

  libraryForm!: FormGroup;

  tagsArray!: FormArray;

  selectedItems: any[] = [];

  libData: Lib[] = [];

  allCourse!: [];

  dropdownSettings: { singleSelection: boolean; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; };

  tagInput: FormControl = new FormControl('');

  videos: FormArray;

  podcasts: FormArray;

  podcastFiles: File[] = [];

  documentFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    protected CoursesApi: CourseApi,
    protected LibraryApi: LibraryApi,
  ) {}

  ngOnInit() {
    this.libraryForm = this.fb.group({
      topic: ['', Validators.required],
      important: [false],
      webSiteLink: [''],
      tags: this.fb.array([]),
      description: [''],
      document: [''],
      relatedTopicId: [''],
      videoDetails: this.fb.array([this.createVideo()]),
      podcastDetails: this.fb.array([this.createPodcast()]),
      podcastFiles: [[]],
      documentFiles: [[]],
    });

    this.dropdownSettings = {
      singleSelection: false,
      textField: 'topic',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 100,
      allowSearchFilter: true,
    };

    this.tagsArray = this.libraryForm.get('tags') as FormArray;
    this.videos = this.libraryForm.get('videoDetails') as FormArray;
    this.podcasts = this.libraryForm.get('podcastDetails') as FormArray;

    this.getAllTopic();
  }

  getAllTopic() {
    this.LibraryApi.getLibrary().subscribe((res: any) => {
      this.libData = res.data;
    });
  }

  addTag() {
    const tag = this.tagInput.value.trim();
    if (tag !== '') {
      this.tagsArray.push(new FormControl(tag));
      this.tagInput.setValue('');
    }
  }

  removeTag(index: number) {
    this.tagsArray.removeAt(index);
  }

  addVideo() {
    const videosArray = this.libraryForm.get('videoDetails') as FormArray;
    videosArray.push(this.createVideo());
  }

  removeVideo(index: number) {
    const videosArray = this.libraryForm.get('videoDetails') as FormArray;
    videosArray.removeAt(index);
  }

  addPodcast() {
    const podcastsArray = this.libraryForm.get('podcastDetails') as FormArray;
    podcastsArray.push(this.createPodcast());
  }

  addDetails() {
    this.addTopic = true;
    this.add = false;
    this.getAllTopic();
  }

  backToLibrary() {
    this.addTopic = false;
    this.editTopic = false;
    this.add = true;
    this.libraryForm.reset();
    this.tagsArray.clear();
    this.topicId = null;
  }

  removePodcast(index: number) {
    const podcastsArray = this.libraryForm.get('podcastDetails') as FormArray;
    podcastsArray.removeAt(index);
  }

  createVideo(): FormGroup {
    return this.fb.group({
      videoName: [''],
      videoLink: [''],
      videoDescription: [''],
    });
  }

  createPodcast(): FormGroup {
    return this.fb.group({
      podcastName: [''],
      podcastLink: [''],
      podcastDescription: [''],
    });
  }

  onPodcastFileChange(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Handle the file changes for the specific input at index 'i' here.
      const selectedFiles = input.files;
      console.log(`Files selected for input ${index + 1}:`, selectedFiles);

      // Add the selected files to this.podcastFiles
      for (let i = 0; i < selectedFiles.length; i++) {
        this.podcastFiles.push(selectedFiles[i]);
      }

      console.log('Updated podcastFiles:', this.podcastFiles);
    }
  }

  onDocumentFileChange(event: any) {
    console.log('event', event.target.files[0]);

    this.libraryForm.controls['document'].setValue(event.target.files[0]);
    // this.documentFiles = event.target.files;
  }

  saveToDatabase() {
    if (this.libraryForm.valid) {
      const formData = new FormData();

      formData.append('topic', this.libraryForm.controls['topic'].value || '');
      formData.append('important', this.libraryForm.controls['important'].value);
      formData.append('description', this.libraryForm.controls['description'].value || '');
      formData.append('tags', this.libraryForm.controls['tags'].value || '');
      formData.append('webSiteLink', this.libraryForm.controls['webSiteLink'].value || '');
      formData.append('relatedTopicId', (this.selectedTopic || '').toString());
      formData.append('videoDetails', JSON.stringify(this.libraryForm.controls['videoDetails'].value) || '');
      formData.append('podcastDetails', JSON.stringify(this.libraryForm.controls['podcastDetails'].value) || '');
      formData.append('documentFiles', this.libraryForm.controls['document'].value || '');

      for (const podcastFile of this.podcastFiles) {
        formData.append('podcastFiles', podcastFile, podcastFile.name);
      }

      // for (const documentFile of this.documentFiles) {
      //   formData.append('documentFiles', documentFile, documentFile.name);
      // }
      console.log('form', this.podcastFiles);

      if (this.topicId == null) {
        this.LibraryApi.addTopic(formData, null).subscribe((res: any) => {
          if (res.status === 200) {
            this.addTopic = false;
            this.add = true;
            this.successFlag = true;
            this.type1 = 'success';
            this.message = res.message;
            this.libraryForm.reset();
            this.tagsArray.clear();
            this.getAllTopic();
            setTimeout(() => {
              this.successFlag = false;
            }, 2000);
          } else if (res.status === 400) {
            this.successFlag = true;
            this.type1 = 'danger';
            this.message = res.message;
            setTimeout(() => {
              this.successFlag = false;
            }, 2000);
          }
        });
      } else {
        this.LibraryApi.addTopic(formData, this.topicId).subscribe((res: any) => {
          if (res.status === 200) {
            this.topicId = null;
            this.successFlag = true;
            this.type1 = 'success';
            this.message = res.message;
            this.editTopic = false;
            this.add = true;
            this.libraryForm.reset();
            this.tagsArray.clear();
            this.getAllTopic();
            setTimeout(() => {
              this.successFlag = false;
            }, 2000);
          } else if (res.status === 400) {
            this.successFlag = true;
            this.type1 = 'danger';
            this.message = res.message;
            setTimeout(() => {
              this.successFlag = false;
            }, 2000);
          }
        });
      }
    } else {
      console.log('Form is invalid');
    }
  }

  clearForm() {
    this.libraryForm.reset();
    this.tagsArray.clear();
    this.add = true;
    this.addTopic = false;
    this.editTopic = false;
    this.topicId = null;
  }

  onDeSelectAll(item: any) {
    this.selectedTopic = [];
  }

  onItemDeSelect(item: any) {
    if (item && item.topic) {
      this.selectedTopic = this.selectedTopic.filter((topicObj) => topicObj.topic !== item.topic);
    }
  }

  onSelectAll(items: any) {
    this.selectedTopic = [];
    for (const item of items) {
      if (item && item.topic) {
        this.selectedTopic.push({ topic: item.topic });
      }
    }
  }

  onItemSelect(item: any) {
    if (item && item.topic) {
      const selectedTopicValues = this.selectedTopic.map((topicObj) => topicObj.topic);
      if (!selectedTopicValues.includes(item.topic)) {
        const topicObject = { topic: item.topic };
        this.selectedTopic.push(topicObject);
      } else {
        console.log('Value already selected:', item.topic);
      }
    }
  }

  editDetails(data: any) {
    this.topicId = data.id;
    this.add = false;
    this.editTopic = true;
    this.LibraryApi.getLibrary().subscribe((res: any) => {
      this.libData = res.data;
      for (let i = 0; i < data.podcastDetails.length - 1; i++) {
        this.addPodcast();
      }
      for (let i = 0; i < data.videoDetails.length - 1; i++) {
        this.addVideo();
      }
      for (const tag of data.tags) {
        const tagControl = new FormControl(tag);
        this.tagsArray.push(tagControl);
      }
      this.selectedTopic = data.relatedTopicId.map((value: any) => ({ topic: value.topic }));
      this.libraryForm.patchValue({
        topic: data.topic,
        important: data.important,
        description: data.description,
        relatedTopicId: this.selectedTopic,
        videoDetails: data.videoDetails,
        podcastDetails: data.podcastDetails,
      });
    });
  }

  deleteTopic(id: number) {
    this.isVisible = true;
    this.alertMessage = 'Are you Sure you want to delete';
    this.topicIdDelete = id;
  }

  deleteTopicData() {
    this.LibraryApi.deleteTopic(this.topicIdDelete).subscribe((res: any) => {
      this.isVisible = false;
      if (res.status === 200) {
        this.successFlag = true;
        this.type1 = 'success';
        this.message = 'Delete College Successfully!';
        setTimeout(() => {
          this.successFlag = false;
        }, 2000);
        this.getAllTopic();
      } else {
        this.successFlag = true;
        this.type1 = 'danger';
        this.message = 'Something is Wrong!';
        setTimeout(() => {
          this.successFlag = false;
        }, 2000);
        this.getAllTopic();
      }
    });
  }

  close() {
    this.isVisible = false;
    this.topicIdDelete = null;
  }
}
